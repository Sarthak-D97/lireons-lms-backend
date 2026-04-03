import prisma from './prisma';

export type BrandingTheme = {
  orgId: string | null;
  organizationName: string;
  serviceName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: string;
  designTheme: 'light' | 'dark' | 'system';
};

const BRAND_FALLBACK: BrandingTheme = {
  orgId: null,
  organizationName: 'SkillAcademy',
  serviceName: 'SkillAcademy',
  logoUrl: null,
  primaryColor: '#0f766e',
  secondaryColor: '#134e4a',
  fontFamily: 'Inter, sans-serif',
  fontSize: '16px',
  designTheme: 'system',
};

export function materialRouteByType(material: { id: string; type: string }): string {
  switch (material.type) {
    case 'VIDEO':
      return `/learn/video/${material.id}`;
    case 'ARTICLE':
      return `/articles/${material.id}`;
    case 'CODE_CHALLENGE':
      return `/problems/${material.id}`;
    default:
      return `/learn/material/${material.id}`;
  }
}

export async function getActiveBrandingTheme(): Promise<BrandingTheme> {
  try {
    const organization = await prisma.tenantOrganization.findFirst({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        settings: true,
        design: true,
      },
    });

    if (!organization) {
      return BRAND_FALLBACK;
    }

    const resolvedTheme = organization.design?.designTheme;
    const designTheme: BrandingTheme['designTheme'] =
      resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'system';

    return {
      orgId: organization.id,
      organizationName: organization.orgName,
      serviceName: organization.settings?.serviceName ?? organization.orgName,
      logoUrl: organization.settings?.logoUrl ?? null,
      primaryColor: organization.settings?.primaryColor ?? BRAND_FALLBACK.primaryColor,
      secondaryColor: organization.settings?.secondaryColor ?? BRAND_FALLBACK.secondaryColor,
      fontFamily: organization.settings?.fontFamily ?? BRAND_FALLBACK.fontFamily,
      fontSize: organization.settings?.fontSize ?? BRAND_FALLBACK.fontSize,
      designTheme,
    };
  } catch {
    return BRAND_FALLBACK;
  }
}

export async function getPublishedCourses(limit = 12) {
  const organization = await prisma.tenantOrganization.findFirst({
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      products: {
        where: {
          status: 'PUBLISHED',
          type: 'COURSE',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          materials: {
            select: {
              id: true,
              type: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      },
    },
  });

  return {
    organization,
    courses:
      organization?.products.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        coverImageUrl: course.coverImageUrl,
        price: Number(course.price),
        discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
        creatorName: course.creator.name,
        materialsCount: course.materials.length,
        enrollmentsCount: course._count.enrollments,
        videosCount: course.materials.filter((material) => material.type === 'VIDEO').length,
      })) ?? [],
  };
}

export async function getHomeSnapshot() {
  const organization = await prisma.tenantOrganization.findFirst({
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      settings: true,
      design: true,
      products: {
        where: {
          status: 'PUBLISHED',
          type: 'COURSE',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 12,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          subjects: {
            where: {
              status: 'PUBLISHED',
            },
            select: {
              id: true,
              name: true,
            },
          },
          materials: {
            select: {
              id: true,
              type: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      },
    },
  });

  const counts = organization
    ? await prisma.material.groupBy({
        by: ['type'],
        where: {
          orgId: organization.id,
          status: 'PUBLISHED',
          type: {
            in: ['ARTICLE', 'CODE_CHALLENGE', 'VIDEO'],
          },
        },
        _count: {
          _all: true,
        },
      })
    : [];

  const byType = new Map(counts.map((entry) => [entry.type, entry._count._all]));

  return {
    organization,
    primaryColor: organization?.settings?.primaryColor ?? BRAND_FALLBACK.primaryColor,
    secondaryColor: organization?.settings?.secondaryColor ?? BRAND_FALLBACK.secondaryColor,
    serviceName: organization?.settings?.serviceName ?? organization?.orgName ?? BRAND_FALLBACK.serviceName,
    organizationName: organization?.orgName ?? BRAND_FALLBACK.organizationName,
    featuredCourses:
      organization?.products.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description ?? 'Practical outcomes-based program.',
        price: Number(course.price),
        discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
        coverImageUrl: course.coverImageUrl,
        creatorId: course.creator.id,
        creatorName: course.creator.name,
        materialsCount: course.materials.length,
        enrollmentsCount: course._count.enrollments,
        subjects: course.subjects.map((subject) => ({
          id: subject.id,
          name: subject.name,
        })),
      })) ?? [],
    articleCount: byType.get('ARTICLE') ?? 0,
    problemsCount: byType.get('CODE_CHALLENGE') ?? 0,
    videoCount: byType.get('VIDEO') ?? 0,
  };
}

export async function getCourseById(courseId: string) {
  return prisma.product.findFirst({
    where: {
      id: courseId,
      status: 'PUBLISHED',
      type: 'COURSE',
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      subjects: {
        where: {
          status: 'PUBLISHED',
        },
        orderBy: {
          orderIndex: 'asc',
        },
        include: {
          topics: {
            where: {
              status: 'PUBLISHED',
            },
            orderBy: {
              orderIndex: 'asc',
            },
            include: {
              materials: {
                where: {
                  status: 'PUBLISHED',
                },
                orderBy: {
                  orderIndex: 'asc',
                },
                include: {
                  metadata: true,
                },
              },
            },
          },
        },
      },
      materials: {
        where: {
          status: 'PUBLISHED',
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });
}

export async function getVideoLessonById(materialId: string) {
  const lesson = await prisma.material.findFirst({
    where: {
      id: materialId,
      status: 'PUBLISHED',
      type: 'VIDEO',
    },
    include: {
      metadata: true,
      media: true,
      topic: {
        include: {
          subject: true,
          product: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return null;
  }

  const timeline = await prisma.material.findMany({
    where: {
      productId: lesson.productId,
      status: 'PUBLISHED',
    },
    orderBy: {
      orderIndex: 'asc',
    },
    include: {
      metadata: true,
      topic: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const currentIndex = timeline.findIndex((entry) => entry.id === lesson.id);

  return {
    lesson,
    timeline,
    currentIndex,
    previous: currentIndex > 0 ? timeline[currentIndex - 1] : null,
    next: currentIndex >= 0 && currentIndex < timeline.length - 1 ? timeline[currentIndex + 1] : null,
  };
}

export async function getArticles(limit = 30) {
  return prisma.material.findMany({
    where: {
      status: 'PUBLISHED',
      type: 'ARTICLE',
    },
    orderBy: [{ orderIndex: 'asc' }],
    take: limit,
    include: {
      metadata: true,
      topic: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getArticleById(id: string) {
  return prisma.material.findFirst({
    where: {
      id,
      status: 'PUBLISHED',
      type: 'ARTICLE',
    },
    include: {
      metadata: true,
      topic: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getProblems(limit = 50) {
  return prisma.material.findMany({
    where: {
      status: 'PUBLISHED',
      type: 'CODE_CHALLENGE',
    },
    orderBy: [{ orderIndex: 'asc' }],
    take: limit,
    include: {
      metadata: true,
      testCases: {
        select: {
          id: true,
          status: true,
        },
      },
      topic: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
}

export async function getProblemById(id: string) {
  return prisma.material.findFirst({
    where: {
      id,
      status: 'PUBLISHED',
      type: 'CODE_CHALLENGE',
    },
    include: {
      metadata: true,
      testCases: {
        select: {
          id: true,
          status: true,
        },
      },
      topic: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
}

export async function getAllPublishedVideos(limit = 80) {
  return prisma.material.findMany({
    where: {
      status: 'PUBLISHED',
      type: 'VIDEO',
    },
    orderBy: [{ orderIndex: 'asc' }],
    take: limit,
    include: {
      topic: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      metadata: true,
      media: {
        select: {
          id: true,
          cloudUrl: true,
          fileName: true,
          fileSizeKb: true,
        },
      },
    },
  });
}
