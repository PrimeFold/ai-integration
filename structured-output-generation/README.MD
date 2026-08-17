# Structure Output Generation

## I'll write down what I learnt about this topic and hopefully whoever reads it may understand well too.

### Its not that BIG of a topic but its something a beginner like me ( for now ) and ( you , maybe ) should know !

- Use Zod schema to structure the ai response using the 'schema' property.
- Use `Promise<OutputStructure>` to make the function return the proper output, then since its an object or json , you can take its shape to map its data into UI.
