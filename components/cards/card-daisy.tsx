type CardProps = {
  title: string;
  children: React.ReactNode;
};

export default function CardDaisy({ title, children }: CardProps) {
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        {children}
      </div>
    </div>
  );
}
