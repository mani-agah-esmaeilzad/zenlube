import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryLandingPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (!category) {
    notFound();
  }

  redirect(`/products?category=${category.slug}`);
}
