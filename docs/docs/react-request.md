---
title: React Request
sidebar_label: React Request
---

The **AsyncData** type removes the need for manual request modeling.

Instead of having to maintain a state like the following, you can store the `AsyncData` value directly.

```ts
type UserQuery = {
  isLoading: boolean;
  error: Error;
  data: User;
};
```

The problem with this representation is that it can represent impossible states, and require additional work to make it safe. It will also encourage nested conditions, which decreases code readability.

Here's how we can represent this using the `AsyncData` type.

```ts
import { useState, useEffect } from "react";
import { AsyncData } from "@bloodyowl/boxed";
import { queryUser, User } from "./api";

type Props = {
  userId: string;
};

const UserPage = ({ userId }: Props) => {
  // Initially, the request hasn't performed
  const [user, setUser] = useState(() => AsyncData.NotAsked<User>());

  useEffect(() => {
    // Indicate that we started loading
    setUser(AsyncData.Loading());
    const cancel = queryUser({ userId }, (user) => {
      // Then, set the received value
      setUser(AsyncData.Done(user));
    });
    return cancel;
  }, [userId]);

  // We can then match on the value, in a flat way
  return user.match({
    NotAsked: () => null,
    Loading: () => `Loading`,
    Done: (user) => `Hello ${user.name}!`,
  });
};
```
