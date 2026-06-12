const items = ['Idag', 'Historik', 'Lägg till', 'Delning', 'Meny'];

export function AppBottomNav() {
  return (
    <div className="bottom-bar">
      {items.map((item) => (
        <span className={item === 'Idag' ? 'bottom-bar-item selected' : 'bottom-bar-item'} key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}
