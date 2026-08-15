function Stripes({ order }) {
  return (
    <div className="grid h-2.5 w-full grid-cols-5">
      {order.map((c, i) => (
        <div key={i} className={c} />
      ))}
    </div>
  );
}

export default Stripes;
