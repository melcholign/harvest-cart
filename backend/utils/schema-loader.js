export async function loadSchema(connection, schemaQuery, schemaName) {
    const loadingMessage = `LOADING ${schemaName} schema...`;
    const timeLabel = `LOADED ${schemaName} schema in`;
    try {
        console.log(loadingMessage);

        console.time(timeLabel);
        await connection.query(schemaQuery);
        console.timeEnd(timeLabel);

        console.log(`${schemaName} schema is READY!`);
    } catch (err) {
        console.error(err);
    }
}