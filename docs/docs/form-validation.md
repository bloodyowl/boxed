---
title: Form Validation
sidebar_label: Form Validation
---

A common need in applications is to validate user-input before sending it to the server.

Let's assume we have a form with the following fields:

```ts
type FormInput = {
  id: string;
  amount: number;
};
```

One can use exceptions:

```ts
const validate = (input: FormInput) => {
  if (input.id.trim().length !== 24) {
    throw new Error("Input ID is invalid");
  }
  if (input.amount <= 0) {
    throw new Error("Invalid amount");
  }
};
```

In that case, we'd use a `try` statement:

```ts
try {
  const sanitized = sanitize(input);
  validate(sanitized);
  setValidation(null);

  // send to the server
} catch (err) {
  setValidation(err);
}
```

Or one can return errors from the `validate` function:

```ts
const validate = (input: FormInput) => {
  const errors = [];
  if (input.id.trim().length !== 24) {
    errors.push("Input ID is invalid");
  }
  if (input.amount <= 0) {
    errors.push("Invalid amount");
  }
  return errors;
};
```

Which would be consumed like the following:

```ts
const sanitized = sanitize(input);
const errors = validate(sanitized);
if (errors.length) {
  setValidation(errors);
  // show the errors
} else {
  setValidation(null);
  // send to the server
}
```

In both cases, we are required to have handle the `validation` state manually, which increases complexity and can lead to UI inconsistencies. Let's see how we can leverage the `Result` type for such patterns:

```ts
import { Result } from "@bloodyowl/boxed";

const validate = (input: FormInput): Result<FormInput, Array<string>> => {
  const errors = [];
  const id = input.id.trim();
  if (id.length !== 24) {
    errors.push("Input ID is invalid");
  }
  if (input.amount <= 0) {
    errors.push("Invalid amount");
  }

  // We can directly return a sanitized version if the validation passed
  return errors.length === 0
    ? Result.Ok({ ...input, id })
    : Result.Error(errors);
};
```

Here, the `validate` return value can directly give you **the sanitized input** or **the validation errors**, depending on which case you're in.

We can then store the `Result` directly:

```ts
// A single codepath for handling the validation
const validation = validate(input);

setValidation(validation);

validation.match({
  Error: () => {} // do nothing
  Ok: (sanitizedInput) => {
    sendToServer(sanitizedInput)
  }
})

// and pattern match in the UI code
<Input
  name="id"
  value={input.id}
  onChange={id => setInput({...input, id}))}
  hasError={validation.match({
    Ok: () => false,
    Error: (errors) => errors.includes("Input ID is invalid"),
  })}
/>;
```
