const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen p-6 lg:pl-[150px] transition-all duration-300">
      {children}
    </div>
  );
};

export default PageWrapper;
