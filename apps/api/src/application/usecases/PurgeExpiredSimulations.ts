import type { Clock } from '../ports/Clock';
import type { SimulationPurger } from '../ports/SimulationPurger';

/** Remove simulações expiradas até agora. Usado pelo Cron de limpeza. */
export class PurgeExpiredSimulations {
  constructor(
    private readonly purger: SimulationPurger,
    private readonly clock: Clock,
  ) {}

  execute(): Promise<number> {
    return this.purger.deleteExpired(this.clock.now().toISOString());
  }
}
