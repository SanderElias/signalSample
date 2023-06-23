import type { Address } from '@ngneat/falso';

const seed =
  'qwertyuiopasdfghjklzxcvbnm' +
  'qwertyuiopasdfghjklzxcvbnm'.toUpperCase() +
  '1234567890';
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

export const genFake = async (id = createUniqueId()): Promise<Person> => {
  const { randEmail, randFirstName, randLastName, randPhoneNumber, randParagraph, randAddress } = await import('@ngneat/falso')
  const firstName = randFirstName();
  const lastName = randLastName();
  const person = {
    id,
    screenName: `${firstName} ${lastName}`,
    firstName,
    lastName,
    adres: randAddress(),
    telefoon: randPhoneNumber(),
    email: randEmail(),
    tags: ['new testData'],
    remark: randParagraph(),
    test: new Set(''),
  }
  return person;
}

export interface Person {
  id: string;
  screenName: string;
  firstName: string;
  lastName: string;
  adres: Address;
  telefoon: string;
  email: string;
  tags: string[];
  remark: string;
  test: Set<string>;
}
