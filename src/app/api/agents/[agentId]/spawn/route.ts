import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureUserNetwork, checkContainerLimit, getTierResourceLimits } from '@/lib/multi-tenant';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const DOCKER_IMAGE = process.env.AGENT_CONTAINER_IMAGE || 'openclaw/agent:latest';
const CONTAINER_PREFIX = 'superclaw-agent-';

/**
 * POST /api/agents/[agentId]/spawn
 * Spawn a Docker container for an agent with multi-tenant isolation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await params;
    const userId = session.user.id;

    // Get the user to check subscription tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check container limit based on tier
    const limitCheck = await checkContainerLimit(userId, user.subscriptionTier);
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: 'Container limit reached',
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeUrl: '/pricing'
      }, { status: 403 });
    }

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

    // Check if already has a container
    if (agent.containerId) {
      return NextResponse.json({ 
        error: 'Container already exists',
        containerId: agent.containerId,
        status: agent.containerStatus
      }, { status: 400 });
    }

    // Get tier-based resource limits
    const tierLimits = getTierResourceLimits(user.subscriptionTier);

    // Ensure user-specific network exists for isolation
    const userNetwork = await ensureUserNetwork(userId);

    // Generate unique container name
    const containerName = `${CONTAINER_PREFIX}${agent.id.slice(-8)}`;
    
    // Build docker run command with agent-specific config and network isolation
    const skills = agent.skills ? JSON.stringify(agent.skills) : '{}';
    const dockerCmd = `docker run -d \
      --name ${containerName} \
      --label "superclaw.agent.id=${agent.id}" \
      --label "superclaw.user.id=${agent.userId}" \
      --network ${userNetwork} \
      -e AGENT_ID=${agent.id} \
      -e USER_ID=${agent.userId} \
      -e AGENT_SKILLS='${skills}' \
      -e NEXT_AUTH_SECRET=${process.env.NEXTAUTH_SECRET} \
      -e NEXT_AUTH_URL=${process.env.NEXTAUTH_URL} \
      --memory=${tierLimits.memoryMB}m \
      --cpus=${tierLimits.cpu} \
      --restart=unless-stopped \
      ${DOCKER_IMAGE}`;

    let containerId = '';
    try {
      const { stdout } = await execAsync(dockerCmd);
      containerId = stdout.trim();
    } catch (execError: any) {
      console.error('Docker spawn error:', execError);
      return NextResponse.json({ 
        error: 'Failed to spawn container',
        details: execError.message 
      }, { status: 500 });
    }

    // Update agent with container info
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        containerId,
        containerStatus: 'starting',
        status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      containerId,
      containerName,
      status: 'starting',
      network: userNetwork,
      resources: {
        memoryMB: tierLimits.memoryMB,
        cpu: tierLimits.cpu,
      },
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        status: updatedAgent.status,
      }
    });
  } catch (error: any) {
    console.error('Spawn error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/agents/[agentId]/spawn
 * Destroy/stop a Docker container for an agent
 */
export async function DELETE(
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

    // Check if has a container
    if (!agent.containerId) {
      return NextResponse.json({ 
        error: 'No container exists for this agent',
      }, { status: 400 });
    }

    const containerName = `${CONTAINER_PREFIX}${agent.id.slice(-8)}`;
    
    // Stop and remove the container
    try {
      await execAsync(
        `docker stop -t 10 ${containerName} 2>/dev/null; docker rm -f ${containerName} 2>/dev/null; echo "done"`
      );
    } catch (execError: any) {
      // Continue anyway to clear the DB record
    }

    // Update agent to remove container info
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        containerId: null,
        containerStatus: null,
        status: 'stopped',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Container destroyed',
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        status: updatedAgent.status,
        containerId: null,
        containerStatus: null,
      }
    });
  } catch (error: any) {
    console.error('Destroy error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
