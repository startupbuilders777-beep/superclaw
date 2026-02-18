import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).optional(),
})

/**
 * GET /api/team
 * Get team members for the current user (owner)
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get team members where user is owner
    const members = await prisma.teamMember.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    })

    return NextResponse.json({
      members,
      tier: user?.subscriptionTier || "FREE",
    })
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

/**
 * POST /api/team
 * Invite a new team member
 */
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if user has AGENCY tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    })

    if (user?.subscriptionTier !== "AGENCY") {
      return NextResponse.json(
        { error: "Team features require AGENCY tier" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { email, name, role } = parsed.data

    // Check if already invited
    const existing = await prisma.teamMember.findUnique({
      where: { email_ownerId: { email, ownerId: session.user.id } },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Already invited or member" },
        { status: 400 }
      )
    }

    const member = await prisma.teamMember.create({
      data: {
        email,
        name,
        role: role || "VIEWER",
        invitedById: session.user.id,
        ownerId: session.user.id,
        invitationToken: Math.random().toString(36).substring(2, 15),
      },
    })

    // TODO: Send invitation email
    console.log("Invite sent to:", email)

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error inviting member:", error)
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 })
  }
}

/**
 * DELETE /api/team
 * Remove a team member
 */
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("id")

  if (!memberId) {
    return NextResponse.json({ error: "Member ID required" }, { status: 400 })
  }

  try {
    // Verify ownership
    const member = await prisma.teamMember.findFirst({
      where: { id: memberId, ownerId: session.user.id },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
  }
}

/**
 * PATCH /api/team
 * Update a team member's role
 */
export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { memberId, role } = body

    if (!memberId || !role) {
      return NextResponse.json(
        { error: "Member ID and role required" },
        { status: 400 }
      )
    }

    // Verify ownership
    const member = await prisma.teamMember.findFirst({
      where: { id: memberId, ownerId: session.user.id },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const updated = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}
