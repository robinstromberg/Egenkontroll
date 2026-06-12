const items = ['Idag', 'Historik', 'Lägg till', 'Delning', 'Meny'];

export function AppBottomNav() {
  return (
    <div
      className="bottom-bar"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 6,
        marginTop: 20,
        border: '1px solid rgba(91, 70, 225, 0.14)',
        borderRadius: 24,
        padding: 8,
        background: 'rgba(255, 255, 255, 0.96)',
      }}
    >
      {items.map((item) => {
        const selected = item === 'Idag';
        return (
          <span
            className={selected ? 'bottom-bar-item selected' : 'bottom-bar-item'}
            key={item}
            style={{
              display: 'grid',
              placeItems: 'center',
              minHeight: 52,
              borderRadius: 18,
              color: selected ? '#5b46e1' : '#657089',
              background: selected ? '#efedff' : 'transparent',
              fontSize: '0.74rem',
              fontWeight: 900,
            }}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}
