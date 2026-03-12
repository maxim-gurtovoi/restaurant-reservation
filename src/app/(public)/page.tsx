import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Book a table in your favorite restaurant"
        subtitle="Browse restaurants, pick a table on the floor plan, and confirm your reservation with a QR code."
      />
      <div className="flex flex-wrap gap-4">
        <Button asChild variant="primary">
          <Link href="/restaurants">Browse restaurants</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}

