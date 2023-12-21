import type { Address } from '@ngneat/falso';

const seed = 'qwertyuiopasdfghjklzxcvbnm' + 'qwertyuiopasdfghjklzxcvbnm'.toUpperCase() + '1234567890';
const seedLength = seed.length;

/**
 * Creates an unique ID based on the current time and a random string
 */
export function createUniqueId(): string {
  return `${Date.now().toString(36)}-${randString(4)}`;
}

/**
 * returns a random string with only a-z A-Z 0-9
 * @param len length of the string to return
 */
export function randString(len: number): string {
  const r = [] as string[];
  while (len--) {
    r.push(seed[Math.floor(Math.random() * seedLength)]);
  }
  return r.join('');
}

import { randAddress, randEmail, randFirstName, randLastName, randParagraph, randPhoneNumber } from '@ngneat/falso';
export const genFake = (id = createUniqueId()): Person => {
  const firstName = randFirstName();
  const lastName = randLastName();
  const person = {
    id,
    screenName: `${firstName} ${lastName}`,
    firstName,
    lastName,
    adres: randAddress(),
    phone: randPhoneNumber(),
    email: randEmail({ firstName, lastName }),
    tags: ['new testData'],
    remark: randParagraph(),
    test: new Set(''),
  };
  return person;
};

export const genFakes = (n: number) => {
  const result: Person[] = [];
  for (let i = 0; i < n; i += 1) {
    result.push(genFake());
  }
  return result;
};

export interface Person {
  id: string;
  screenName: string;
  firstName: string;
  lastName: string;
  adres: Address;
  phone: string;
  email: string;
  tags: string[];
  remark: string;
  test: Set<string>;
}
