with open('src/views/BookDetail.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
'''                <div className="font-display text-base font-semibold text-cream">{m.value}</div>
            ))}''',
'''                <div className="font-display text-base font-semibold text-cream">{m.value}</div>
              </div>
            ))}'''
)

with open('src/views/BookDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
