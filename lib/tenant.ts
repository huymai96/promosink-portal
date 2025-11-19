import { prisma } from "@/lib/prisma";

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
  });
}

export async function getTenantByDomain(hostname: string): Promise<string | null> {
  // Extract tenant slug from subdomain or domain
  // e.g., "acme.promosink.com" -> "acme"
  // or "promosink.com" -> default tenant
  const parts = hostname.split(".");
  
  if (parts.length >= 3) {
    // Has subdomain
    return parts[0];
  }
  
  // Default tenant or handle main domain
  // For now, return null and handle in middleware
  return null;
}

