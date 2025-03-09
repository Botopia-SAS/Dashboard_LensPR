const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen p-6 lg:pl-[180px] transition-all duration-300 bg-white text-black">
      {children}
    </div>
  );
};

export default PageWrapper;
