import { DesignIntent, Plot } from '@aihome/domain';
import { ConceptGenerationResult } from '../core/types';
import { Compiler } from './Compiler';
import { CompactStrategy } from '../strategies/CompactStrategy';

export interface GenerationOptions {
  maxCandidates: number;
  timeoutMs: number;
}

export class Generator {
  public static generate(
    intent: DesignIntent,
    plot: Plot,
    seed: string,
    options: GenerationOptions = { maxCandidates: 5, timeoutMs: 5000 },
  ): ConceptGenerationResult {
    // 1. Compile constraints
    const context = Compiler.compile(intent, plot);

    // 2. Feasibility check
    const feasibility = Compiler.checkFeasibility(context);
    if (!feasibility.feasible) {
      return {
        requestId: `req-${Date.now()}`,
        status: 'INPUT_INVALID',
        engineVersion: '1.0.0',
        seed,
        concepts: [],
        failures: [feasibility.code || 'UNKNOWN'],
        diagnostics: { reason: feasibility.reason },
      };
    }

    // 3. Search Loop (Bounded by timeout)
    const startTime = Date.now();
    const concepts = [];
    const failures = [];

    // Run the CompactStrategy (In MVP we only have this one)
    for (let i = 0; i < options.maxCandidates; i++) {
      if (Date.now() - startTime > options.timeoutMs) {
        failures.push('LIMIT_REACHED');
        break;
      }

      const candidate = CompactStrategy.generate(context, `${seed}-var${i}`);
      if (candidate) {
        concepts.push(candidate);
      } else {
        failures.push('NO_FEASIBLE_CONCEPT_ON_BRANCH');
      }
    }

    let status: ConceptGenerationResult['status'] = 'SUCCESS';
    if (concepts.length === 0) {
      status = 'NO_FEASIBLE_CONCEPT';
    } else if (concepts.length < options.maxCandidates) {
      status = 'PARTIAL';
    }

    return {
      requestId: `req-${Date.now()}`,
      status,
      engineVersion: '1.0.0',
      seed,
      concepts,
      failures,
    };
  }
}
