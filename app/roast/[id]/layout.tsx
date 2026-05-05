import type { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const pageUrl = `${appUrl}/roast/${id}`
  const ogImageUrl = `${appUrl}/api/v1/roasts/${id}/og-image`

  return {
    title: 'My LinkedIn got roasted by AI 💀',
    description: 'See my LinkedIn profile scores and roast. Then get yours roasted.',
    openGraph: {
      title: 'My LinkedIn got roasted by AI 💀',
      description: 'See my LinkedIn profile scores and roast. Then get yours roasted.',
      url: pageUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'LinkedIn Roast Score',
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'My LinkedIn got roasted by AI 💀',
      description: 'See my LinkedIn profile scores and roast.',
      images: [ogImageUrl],
    },
  }
}

export default function RoastLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
