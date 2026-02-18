import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const NETWORK_PREFIX = 'superclaw-user-';

/**
 * Multi-tenant infrastructure utilities for Docker-based isolation
 */

// Create a user-specific Docker network for isolation
export async function ensureUserNetwork(userId: string): Promise<string> {
  const networkName = `${NETWORK_PREFIX}${userId.slice(-8)}`;
  
  try {
    // Check if network exists
    await execAsync(`docker network inspect ${networkName} 2>/dev/null`);
    return networkName;
  } catch {
    // Network doesn't exist, create it
    await execAsync(
      `docker network create ` +
      `--driver bridge ` +
      `--label "superclaw.user.id=${userId}" ` +
      `--opt "com.docker.network.bridge.name=${networkName}" ` +
      `${networkName}`
    );
    console.log(`Created user network: ${networkName}`);
    return networkName;
  }
}

// Get all containers in a user's network
export async function getUserContainers(userId: string): Promise<string[]> {
  const networkName = `${NETWORK_PREFIX}${userId.slice(-8)}`;
  
  try {
    const { stdout } = await execAsync(
      `docker network inspect ${networkName} --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null`
    );
    return stdout.trim().split(' ').filter(Boolean);
  } catch {
    return [];
  }
}

// Get resource usage for a user's containers
export async function getUserResourceUsage(userId: string): Promise<{
  containers: number;
  cpuPercent: number;
  memoryMB: number;
}> {
  const containers = await getUserContainers(userId);
  
  if (containers.length === 0) {
    return { containers: 0, cpuPercent: 0, memoryMB: 0 };
  }

  let totalCpu = 0;
  let totalMemoryMB = 0;

  for (const container of containers) {
    try {
      // Get CPU and memory stats
      const { stdout } = await execAsync(
        `docker stats ${container} --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}" 2>/dev/null`
      );
      
      const [cpuStr, memStr] = stdout.trim().split('|');
      
      // Parse CPU percentage
      const cpuPercent = parseFloat(cpuStr?.replace('%', '') || '0');
      totalCpu += cpuPercent;
      
      // Parse memory (format: "123MiB / 512MiB" or "1.5GiB / 2GiB")
      const memMatch = memStr?.match(/([\d.]+)(Mi|Gi)/);
      if (memMatch) {
        const memValue = parseFloat(memMatch[1]);
        const memUnit = memMatch[2];
        totalMemoryMB += memUnit === 'Gi' ? memValue * 1024 : memValue;
      }
    } catch {
      // Container might have stopped
    }
  }

  return {
    containers: containers.length,
    cpuPercent: Math.round(totalCpu * 100) / 100,
    memoryMB: Math.round(totalMemoryMB),
  };
}

// Stop all containers for a user (for cleanup/account termination)
export async function stopUserContainers(userId: string): Promise<number> {
  const containers = await getUserContainers(userId);
  
  for (const container of containers) {
    try {
      await execAsync(`docker stop -t 10 ${container} 2>/dev/null`);
    } catch {
      // Continue even if stop fails
    }
  }
  
  return containers.length;
}

// Remove user network and all containers
export async function destroyUserEnvironment(userId: string): Promise<void> {
  const networkName = `${NETWORK_PREFIX}${userId.slice(-8)}`;
  
  // Stop all containers first
  await stopUserContainers(userId);
  
  // Remove containers
  const containers = await getUserContainers(userId);
  for (const container of containers) {
    try {
      await execAsync(`docker rm -f ${container} 2>/dev/null`);
    } catch {
      // Continue
    }
  }
  
  // Remove network
  try {
    await execAsync(`docker network rm ${networkName} 2>/dev/null`);
  } catch {
    // Network might not exist
  }
}

// Get default resource limits based on subscription tier
export function getTierResourceLimits(tier: string): {
  memoryMB: number;
  cpu: number;
  maxContainers: number;
} {
  const limits: Record<string, { memoryMB: number; cpu: number; maxContainers: number }> = {
    FREE: { memoryMB: 512, cpu: 0.5, maxContainers: 1 },
    STARTER: { memoryMB: 1024, cpu: 1, maxContainers: 3 },
    PRO: { memoryMB: 2048, cpu: 2, maxContainers: 10 },
    AGENCY: { memoryMB: 4096, cpu: 4, maxContainers: -1 }, // -1 = unlimited
  };
  
  return limits[tier] || limits.FREE;
}

// Check if user has reached their container limit
export async function checkContainerLimit(userId: string, tier: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
}> {
  const limits = getTierResourceLimits(tier);
  const containers = await getUserContainers(userId);
  const current = containers.length;
  
  if (limits.maxContainers === -1) {
    return { allowed: true, current, limit: -1 };
  }
  
  return {
    allowed: current < limits.maxContainers,
    current,
    limit: limits.maxContainers,
  };
}
