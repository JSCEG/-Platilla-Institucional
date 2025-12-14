// Test script to verify column type generation
function testColumnTypes() {
    const datos = [
        ['Tecnología', 'Capacidad (MW)', 'Participación (%)', 'Nota'],
        ['Solar FV', '12,500', '18.5', 'Ejemplo'],
        ['Eólica', '16,000', '23.7', 'Ejemplo']
    ];
    
    const numCols = datos[0].length;
    console.log('Number of columns:', numCols);
    
    const especCols = 'H{3cm}' + ('G{2cm}'.repeat(numCols - 1));
    console.log('Column specification:', especCols);
    
    const expected = 'H{3cm}G{2cm}G{2cm}G{2cm}';
    console.log('Expected:', expected);
    console.log('Match:', especCols === expected);
    
    return especCols;
}

// Run test
const result = testColumnTypes();
console.log('Final result:', result);