import {defined} from 'common';
import { storedJsonProp } from 'common/storage';

interface SessionRound {
  id: string;
  result?: boolean;
}
interface Store {
  theme: string;
  rounds: SessionRound[];
  at: number;
}

export default class PuzzleSession {

  maxSize = 50;
  maxAge = 1000 * 3600;

  constructor(readonly theme: string) {
  }

  default = () => ({
    theme: this.theme,
    rounds: [],
    at: Date.now()
  });

  store = storedJsonProp<Store>('puzzle.session', this.default);
  
  clear = () => this.update(s => ({ ...s, rounds: [] }));

  get = () => {
    const prev = this.store();
    return prev.theme == this.theme && prev.at > Date.now() - this.maxAge ? prev : this.default();
  }

  update = (f: (s: Store) => Store): Store => this.store(f(this.get()));

  complete = (id: string, result: boolean) =>
    this.update(s => {
      const i = this.indexOf(s.rounds, id);
      if (i == -1) s.rounds.push({ id, result });
      else s.rounds[i].result = result;
      s.at = Date.now();
      return s;
    });

  indexOf = (rounds: SessionRound[], id: string): number => 
    rounds.findIndex(r => r.id == id);
}
