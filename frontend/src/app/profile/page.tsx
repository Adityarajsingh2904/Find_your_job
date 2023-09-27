import ProfileForm from "@/components/ui/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-center">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}
