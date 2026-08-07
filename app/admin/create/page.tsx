import { HotelCreateForm } from '@/components/hotel-create-form'

export default async function CreateHotelPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl items-start justify-center px-4 py-10">
      <HotelCreateForm />
    </main>
  )
}
