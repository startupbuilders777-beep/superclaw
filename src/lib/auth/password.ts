import "server-only"
import { hash, verify } from "@node-rs/argon2"

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await verify(hashedPassword, password)
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  })
}
