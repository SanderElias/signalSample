# SignalSample

This project is here to be able to talk about Signals and Signal inputs.
In it's current state it is mimic'ing signal inputs in the data-row component. It uses a setter.
But it clearly shows that an input is a value that will change over time. There is a conceptual clash here.

Also there are some bugs in here. Those are not intended, but illustrate the issue we talked about.

1. refresh the page a couple times, you will see some parts are not updated.
2. try clicking on the table headers to change the sorting. When you reclick the same one, it will not reverse?
3. when data is still loading, and you paginate, the pagination stops being updated.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
