import {useEffect, useRef, useState} from 'react';
import type {ReadonlyBehaviorSubject} from 'rx-use';

export const useBehaviorSubject = <T>(subject: ReadonlyBehaviorSubject<T>): T => {
  const ref = useRef<T>(subject.getValue());
  const [, setCnt] = useState(0);

  useEffect(() => {
    const subscription = subject.subscribe((value) => {
      ref.current = value;
      setCnt((prev) => prev + 1);
    });
    return () => subscription.unsubscribe();
  }, [subject]);

  return ref.current;
};

export const useBehaviorSubjectOpt = <T>(subject?: ReadonlyBehaviorSubject<T>): T | undefined => {
  const ref = useRef<T | undefined>(subject?.getValue());
  const [, setCnt] = useState(0);

  useEffect(() => {
    if (!subject) {
      ref.current = undefined;
      return;
    }
    const subscription = subject.subscribe((value) => {
      ref.current = value;
      setCnt((prev) => prev + 1);
    });
    return () => subscription.unsubscribe();
  }, [subject]);

  return ref.current;
};
