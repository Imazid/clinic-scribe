'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TasksRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/close?view=inbox');
  }, [router]);
  return null;
}
