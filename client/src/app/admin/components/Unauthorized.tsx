const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">403 – Unauthorized</h1>
        <p className="text-muted-foreground mb-4">
          You do not have permission to access this page.
        </p>
        <a href="/" className="text-primary underline">
          Go back home
        </a>
      </div>
    </div>
  );
};

export default Unauthorized;
