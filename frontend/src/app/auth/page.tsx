import AuthForm from "@/components/AuthForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Blue Collar Connect</h1>
          <p className="text-gray-600">Connecting skilled workers with opportunities</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <AuthForm />
        </div>
      </div>
    </main>
  )
}

