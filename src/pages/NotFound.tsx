import { Link } from 'react-router'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export default function NotFound() {
  return (
    <Empty className="border border-dashed py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Compass />
        </EmptyMedia>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>That page doesn’t exist. Let’s get you back on track.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
