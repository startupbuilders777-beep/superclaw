import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CONTAINER_PREFIX = 'superclaw-agent-';

/**
 * GET /api/agents/[agentId]/status
 * Get container status for an agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await params;

    // Get the agent
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId: session.user.id,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // If no container, return basic info
    if (!agent.containerId) {
      return NextResponse.json({
        hasContainer: false,
        agent: {
          id: agent.id,
          name: agent.name,
          status: agent.status,
        }
      });
    }

    // Get actual container status from Docker
    const containerName = `${CONTAINER_PREFIX}${agent.id.slice(-8)}`;
    let dockerStatus = null;
    let containerStats = null;

    try {
      // Get container status
      const { stdout } = await execAsync(
        `docker inspect --format='{{.State.Status}}' ${containerName} 2>/dev/null || echo "not_found"`
      );
      dockerStatus = stdout.trim();

      // Get container stats (CPU, Memory)
      const statsOutput = await execAsync(
        `docker stats --no-stream --format '{{.CPUPerc}}|{{.MemUsage}}' ${containerName} 2>/dev/null || echo ""`
      );
      if (statsOutput.stdout.trim()) {
        const [cpu, mem] = statsOutput.stdout.trim().split('|');
        containerStats = { cpu, memory: mem };
      }
    } catch (execError) {
      // Container might not exist anymore
      dockerStatus = 'not_found';
    }

    // Update the agent status if Docker reports different
    let updatedAgent = agent;
    if (dockerStatus === 'not_found' && agent.containerId) {
      // Container was removed externally, update DB
      updatedAgent = await prisma.agent.update({
        where: { id: agentId },
        data: {
          containerId: null,
          containerStatus: null,
          status: 'stopped',
        },
      });
    } else if (dockerStatus && dockerStatus !== agent.containerStatus) {
      updatedAgent = await prisma.agent.update({
        where: { id: agentId },
        data: {
          containerStatus: dockerStatus,
        },
      });
    }

    return NextResponse.json({
      hasContainer: true,
      containerId: updatedAgent.containerId,
      containerName,
      dockerStatus,
      containerStats,
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        status: updatedAgent.status,
        healthStatus: updatedAgent.healthStatus,
        lastHealthCheck: updatedAgent.lastHealthCheck,
        lastError: updatedAgent.lastError,
      }
    });
  } catch (error: any) {
    console.error('Status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
