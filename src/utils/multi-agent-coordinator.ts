import { NavigationAgent, ReminderAgent } from './agents';
import { DiningAgent, AcademicAgent, EventAgent, ServiceAgent, ScholarshipAgent } from './specialized-agents';
import { enhancedRealtimeAgents } from './enhanced-realtime-agents';

interface AgentResponse {
  success: boolean;
  data: any;
  message: string;
  confidence: number;
  processingTime: number;
  source: string;
}

interface MultiAgentResult {
  primary: AgentResponse;
  secondary?: AgentResponse[];
  totalTime: number;
  agentsUsed: string[];
  strategy: 'single' | 'parallel' | 'cascade';
}

export class MultiAgentCoordinator {
  private agents: Map<string, any> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor() {
    // Initialize all agents
    this.agents.set('dining', new DiningAgent());
    this.agents.set('academic', new AcademicAgent());
    this.agents.set('event', new EventAgent());
    this.agents.set('service', new ServiceAgent());
    this.agents.set('scholarship', new ScholarshipAgent());
    this.agents.set('navigation', new NavigationAgent());
    this.agents.set('reminder', new ReminderAgent());
    
    // Add enhanced real-time agents
    enhancedRealtimeAgents.forEach(agent => {
      this.agents.set(agent.name.toLowerCase().replace(' ', '_'), agent);
    });
    
    // Initialize performance tracking
    for (const agentName of this.agents.keys()) {
      this.performanceMetrics.set(agentName, []);
    }
  }

  async processQuery(query: string): Promise<MultiAgentResult> {
    const startTime = Date.now();
    console.log('🤖 Multi-Agent processing query:', query);

    // Step 1: Get confidence scores from all agents
    const agentScores = await this.getAgentScores(query);
    console.log('📊 Agent confidence scores:', agentScores);

    // Step 2: Determine processing strategy
    const strategy = this.determineStrategy(agentScores);
    console.log('🎯 Processing strategy:', strategy);

    let result: MultiAgentResult;

    switch (strategy) {
      case 'single':
        result = await this.processSingle(query, agentScores);
        break;
      case 'parallel':
        result = await this.processParallel(query, agentScores);
        break;
      case 'cascade':
        result = await this.processCascade(query, agentScores);
        break;
      default:
        result = await this.processSingle(query, agentScores);
    }

    result.totalTime = Date.now() - startTime;
    this.updatePerformanceMetrics(result);
    
    console.log('✅ Multi-Agent result:', {
      strategy: result.strategy,
      agentsUsed: result.agentsUsed,
      totalTime: result.totalTime,
      primaryConfidence: result.primary.confidence
    });

    return result;
  }

  private async getAgentScores(query: string): Promise<Array<{name: string, score: number, agent: any}>> {
    const scores: Array<{name: string, score: number, agent: any}> = [];
    
    for (const [name, agent] of this.agents.entries()) {
      try {
        const score = agent.canHandle(query);
        scores.push({ name, score, agent });
      } catch (error) {
        console.warn(`Agent ${name} failed confidence check:`, error);
        scores.push({ name, score: 0, agent });
      }
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  private determineStrategy(agentScores: Array<{name: string, score: number}>): 'single' | 'parallel' | 'cascade' {
    const topScore = agentScores[0]?.score || 0;
    const secondScore = agentScores[1]?.score || 0;
    const highConfidenceAgents = agentScores.filter(s => s.score > 0.6).length;

    // Single agent strategy - one clear winner
    if (topScore > 0.8 && (topScore - secondScore) > 0.3) {
      return 'single';
    }

    // Parallel strategy - multiple high-confidence agents
    if (highConfidenceAgents >= 2 && topScore > 0.5) {
      return 'parallel';
    }

    // Cascade strategy - try agents in sequence
    if (topScore > 0.4) {
      return 'cascade';
    }

    // Fallback to single
    return 'single';
  }

  private async processSingle(query: string, agentScores: Array<{name: string, score: number, agent: any}>): Promise<MultiAgentResult> {
    const topAgent = agentScores[0];
    
    if (!topAgent || topAgent.score < 0.1) {
      return {
        primary: {
          success: false,
          data: null,
          message: "I'm not sure how to help with that. Could you try asking about dining, events, courses, faculty, or campus services?",
          confidence: 0.1,
          processingTime: 0,
          source: 'coordinator'
        },
        totalTime: 0,
        agentsUsed: ['coordinator'],
        strategy: 'single'
      };
    }

    try {
      const result = await topAgent.agent.process(query);
      return {
        primary: result,
        totalTime: 0, // Will be set by caller
        agentsUsed: [topAgent.name],
        strategy: 'single'
      };
    } catch (error) {
      console.error(`Agent ${topAgent.name} failed:`, error);
      return {
        primary: {
          success: false,
          data: null,
          message: "I encountered an issue processing your request. Please try again.",
          confidence: 0.1,
          processingTime: 0,
          source: topAgent.name
        },
        totalTime: 0,
        agentsUsed: [topAgent.name],
        strategy: 'single'
      };
    }
  }

  private async processParallel(query: string, agentScores: Array<{name: string, score: number, agent: any}>): Promise<MultiAgentResult> {
    const candidateAgents = agentScores.filter(s => s.score > 0.5).slice(0, 3);
    
    console.log('🔄 Running parallel agents:', candidateAgents.map(a => a.name));
    
    // Run agents in parallel
    const promises = candidateAgents.map(async ({ name, agent }) => {
      try {
        const result = await agent.process(query);
        return { name, result };
      } catch (error) {
        console.error(`Parallel agent ${name} failed:`, error);
        return {
          name,
          result: {
            success: false,
            data: null,
            message: `${name} agent failed`,
            confidence: 0.1,
            processingTime: 0,
            source: name
          }
        };
      }
    });

    const results = await Promise.all(promises);
    const successfulResults = results.filter(r => r.result.success);

    if (successfulResults.length === 0) {
      return this.processSingle(query, agentScores);
    }

    // Find the best result
    const primaryResult = successfulResults.reduce((best, current) => 
      current.result.confidence > best.result.confidence ? current : best
    );

    // Combine secondary results
    const secondaryResults = successfulResults
      .filter(r => r.name !== primaryResult.name)
      .map(r => r.result);

    return {
      primary: primaryResult.result,
      secondary: secondaryResults.length > 0 ? secondaryResults : undefined,
      totalTime: 0,
      agentsUsed: results.map(r => r.name),
      strategy: 'parallel'
    };
  }

  private async processCascade(query: string, agentScores: Array<{name: string, score: number, agent: any}>): Promise<MultiAgentResult> {
    const candidateAgents = agentScores.filter(s => s.score > 0.3).slice(0, 3);
    
    console.log('🔄 Running cascade agents:', candidateAgents.map(a => a.name));
    
    for (const { name, agent } of candidateAgents) {
      try {
        const result = await agent.process(query);
        
        if (result.success && result.confidence > 0.6) {
          return {
            primary: result,
            totalTime: 0,
            agentsUsed: [name],
            strategy: 'cascade'
          };
        }
      } catch (error) {
        console.warn(`Cascade agent ${name} failed, trying next:`, error);
        continue;
      }
    }

    // If cascade fails, fall back to single
    return this.processSingle(query, agentScores);
  }

  private updatePerformanceMetrics(result: MultiAgentResult) {
    // Track performance for optimization
    result.agentsUsed.forEach(agentName => {
      const metrics = this.performanceMetrics.get(agentName) || [];
      metrics.push(result.totalTime);
      
      // Keep only last 50 measurements
      if (metrics.length > 50) {
        metrics.shift();
      }
      
      this.performanceMetrics.set(agentName, metrics);
    });
  }

  getPerformanceStats(): Record<string, { avgTime: number, successRate: number, callCount: number }> {
    const stats: Record<string, { avgTime: number, successRate: number, callCount: number }> = {};
    
    for (const [agentName, times] of this.performanceMetrics.entries()) {
      if (times.length > 0) {
        stats[agentName] = {
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          successRate: 0.95, // Placeholder - would track actual success rate
          callCount: times.length
        };
      }
    }
    
    return stats;
  }

  // Method for handling complex multi-intent queries
  async processComplexQuery(query: string): Promise<MultiAgentResult> {
    // Detect if query has multiple intents
    const intents = this.detectMultipleIntents(query);
    
    if (intents.length > 1) {
      console.log('🎯 Multi-intent query detected:', intents);
      return this.processParallel(query, await this.getAgentScores(query));
    }
    
    return this.processQuery(query);
  }

  private detectMultipleIntents(query: string): string[] {
    const intents = [];
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('dining') || queryLower.includes('food')) intents.push('dining');
    if (queryLower.includes('event') || queryLower.includes('activity')) intents.push('event');
    if (queryLower.includes('course') || queryLower.includes('class')) intents.push('academic');
    if (queryLower.includes('parking') || queryLower.includes('wifi')) intents.push('service');
    if (queryLower.includes('building') || queryLower.includes('direction')) intents.push('navigation');
    if (queryLower.includes('scholarship') || queryLower.includes('financial aid')) intents.push('scholarship');
    
    return intents;
  }
}

// Singleton instance
export const multiAgentCoordinator = new MultiAgentCoordinator();
