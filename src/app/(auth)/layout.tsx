export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-[380px]">{children}</div>
    </div>
  );
}
