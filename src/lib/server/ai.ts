import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

const openai = new OpenAI({
	apiKey: env.OPENAI_API_KEY || ''
});

export interface SessionAnalysisResult {
	summary: string;
	bpmPattern: {
		progressive: boolean;
		avgIncrease: number;
		notes: string;
	};
	focus: {
		score: number; // 0-100
		pauseRatio: number;
		notes: string;
	};
	strugglePoints: string[];
	completionTrend: {
		rate: number;
		notes: string;
	};
	consistency: {
		score: number;
		notes: string;
	};
	commentAnalysis: {
		sentiment: 'positive' | 'neutral' | 'negative';
		keywords: string[];
		weaknesses: string[];
		notes: string;
	};
	recommendations: string[];
}

export interface SheetGenerationRequest {
	instrument: string;
	userProfile: {
		level: string;
		totalPracticeHours: number;
		avgBpm: number;
		maxCleanBpm: number;
		strongAreas: string[];
		weakAreas: string[];
		preferredGenres?: string[];
	};
	recentSessions: Array<{
		date: string;
		bpm: number;
		completionRate: number;
		strugglePoints: string[];
		userComment?: string;
	}>;
	generationParams: {
		difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'adaptive';
		focusArea?: string | 'auto';
		durationBars?: number;
		style?: string;
		bpmSuggestion?: boolean;
	};
}

export interface GeneratedSheet {
	title: string;
	description: string;
	difficulty: string;
	suggestedBpm: number;
	targetBpm: number;
	timeSignature: string;
	key: string;
	bars: number;
	focusAreas: string[];
	noteData: {
		measures: Array<{
			bar: number;
			beats: Array<{
				pitch: string;
				duration: string;
				string?: number;
				fret?: number;
			}>;
		}>;
	};
	tabData: {
		measures: Array<{
			bar: number;
			strings: {
				[key: string]: string[];
			};
		}>;
	};
	practiceTips: string[];
	progressionPlan: {
		step1: string;
		step2: string;
		step3: string;
		finalGoal: string;
	};
}

export async function analyzeSession(
	sessionData: any,
	userComment?: string,
	quickTags?: string[]
): Promise<SessionAnalysisResult> {
	const prompt = `You are an AI music practice coach analyzing a practice session. Analyze the following session data and provide structured feedback.

Session Data:
${JSON.stringify(sessionData, null, 2)}

${userComment ? `User Comment: ${userComment}` : ''}
${quickTags && quickTags.length > 0 ? `Quick Tags: ${quickTags.join(', ')}` : ''}

Provide a JSON response with the following structure:
{
  "summary": "Brief overall summary",
  "bpmPattern": {
    "progressive": boolean,
    "avgIncrease": number,
    "notes": "string"
  },
  "focus": {
    "score": number (0-100),
    "pauseRatio": number,
    "notes": "string"
  },
  "strugglePoints": ["string"],
  "completionTrend": {
    "rate": number,
    "notes": "string"
  },
  "consistency": {
    "score": number,
    "notes": "string"
  },
  "commentAnalysis": {
    "sentiment": "positive" | "neutral" | "negative",
    "keywords": ["string"],
    "weaknesses": ["string"],
    "notes": "string"
  },
  "recommendations": ["string"]
}`;

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content:
						'You are an expert music practice coach. Analyze practice sessions and provide constructive, actionable feedback. Always respond with valid JSON only.'
				},
				{ role: 'user', content: prompt }
			],
			temperature: 0.7,
			response_format: { type: 'json_object' }
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error('No response from OpenAI');
		}

		return JSON.parse(content) as SessionAnalysisResult;
	} catch (error) {
		console.error('AI analysis error:', error);
		throw error;
	}
}

export async function generateSheet(request: SheetGenerationRequest): Promise<GeneratedSheet> {
	const focusArea = request.generationParams?.focusArea || 'auto';
	const isScalePractice = focusArea === 'scale';
	const instrument = request.instrument || 'guitar';
	
	let practiceTypeInstruction = '';
	if (isScalePractice) {
		const scaleType = request.generationParams?.scaleType || 'major';
		const scaleKey = request.generationParams?.scaleKey || 'C';
		
		practiceTypeInstruction = `CRITICAL: This is a SCALE PRACTICE session for ${instrument}. You MUST generate a proper ${scaleKey} ${scaleType} scale pattern.

SCALE REQUIREMENTS:
1. Scale Type: ${scaleType} scale
2. Root Note: ${scaleKey}
3. Generate the scale ascending (low to high) and descending (high to low)
4. Use proper guitar tablature notation with these rules:
   - Standard guitar tuning: E (6th/low), A (5th), D (4th), G (3rd), B (2nd), e (1st/high)
   - Each measure should contain 8 beats (eighth notes)
   - Show the scale notes on appropriate strings and frets
   - Use "-" for rests/empty beats
   - Use fret numbers as strings (e.g., "0", "2", "3", "5", "7", "8", "10", "12")
   
5. Scale Pattern Example for C Major (ascending):
   - Start from low E string, move across strings
   - E string: 0(C), 3(E), 5(G)
   - A string: 3(C), 5(D), 7(E)
   - D string: 2(E), 5(G), 7(A)
   - G string: 2(A), 4(B), 5(C)
   - B string: 1(C), 3(D), 5(E)
   - e string: 0(E), 3(G), 5(A), 8(C)
   
6. Generate 4 measures ascending, then 4 measures descending
7. Use eighth note duration ("8n") for all notes
8. The tabData must use these exact string names: "e", "B", "G", "D", "A", "E" (from high to low)

IMPORTANT: The scale must follow proper music theory intervals for ${scaleType} scale starting from ${scaleKey}.`;
	} else {
		practiceTypeInstruction = 'Generate a general practice exercise that matches the user\'s skill level and addresses their weaknesses.';
	}
	
	const prompt = `You are an AI music teacher generating personalized practice sheets. Generate a practice sheet based on the following user profile and recent sessions.

User Profile:
${JSON.stringify(request.userProfile, null, 2)}

Recent Sessions:
${JSON.stringify(request.recentSessions, null, 2)}

Generation Parameters:
${JSON.stringify(request.generationParams, null, 2)}

${practiceTypeInstruction}

Generate a practice sheet in JSON format with the following structure:
{
  "title": "string",
  "description": "string",
  "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
  "suggestedBpm": number,
  "targetBpm": number,
  "timeSignature": "string",
  "key": "string",
  "bars": number,
  "focusAreas": ["string"],
  "noteData": {
    "measures": [
      {
        "bar": number,
        "beats": [
          {
            "pitch": "string (e.g., A3, E4)",
            "duration": "string (e.g., 8n, 4n, 2n)",
            "string": number (1-6 for guitar),
            "fret": number
          }
        ]
      }
    ]
  },
  "tabData": {
    "measures": [
      {
        "bar": number,
        "strings": {
          "e": ["string"],
          "B": ["string"],
          "G": ["string"],
          "D": ["string"],
          "A": ["string"],
          "E": ["string"]
        }
      }
    ]
    },
  "practiceTips": ["string"],
  "progressionPlan": {
    "step1": "string",
    "step2": "string",
    "step3": "string",
    "finalGoal": "string"
  }
}`;

	try {
		const systemMessage = isScalePractice
			? 'You are an expert guitar teacher specializing in scale exercises. You understand proper scale patterns, finger positioning, and tablature notation. When generating scale exercises, you MUST create musically correct scales following standard music theory. Always respond with valid JSON only.'
			: 'You are an expert music teacher creating personalized practice exercises. Generate practice sheets that match the user\'s skill level and address their weaknesses. Always respond with valid JSON only.';
		
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: systemMessage
				},
				{ role: 'user', content: prompt }
			],
			temperature: isScalePractice ? 0.3 : 0.8, // Lower temperature for more consistent scale patterns
			response_format: { type: 'json_object' }
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error('No response from OpenAI');
		}

		return JSON.parse(content) as GeneratedSheet;
	} catch (error) {
		console.error('AI sheet generation error:', error);
		throw error;
	}
}

export async function analyzeCommentNLP(
	comment: string,
	sessionData?: any
): Promise<{
	sentiment: 'positive' | 'neutral' | 'negative';
	keywords: string[];
	weaknesses: string[];
	suggestions: string[];
}> {
	const prompt = `Analyze the following practice comment and extract insights:

Comment: "${comment}"

${sessionData ? `Session Context: ${JSON.stringify(sessionData, null, 2)}` : ''}

Provide a JSON response:
{
  "sentiment": "positive" | "neutral" | "negative",
  "keywords": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"]
}`;

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content:
						'You are an expert at analyzing practice feedback. Extract sentiment, keywords, weaknesses, and actionable suggestions. Always respond with valid JSON only.'
				},
				{ role: 'user', content: prompt }
			],
			temperature: 0.5,
			response_format: { type: 'json_object' }
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error('No response from OpenAI');
		}

		return JSON.parse(content);
	} catch (error) {
		console.error('AI comment analysis error:', error);
		throw error;
	}
}

export async function generatePeriodicReport(
	userId: string,
	type: 'weekly' | 'monthly',
	sessions: any[],
	summary: any
): Promise<{
	summary: string;
	strengths: string[];
	weaknesses: string[];
	improvements: string[];
	recommendations: string[];
}> {
	const prompt = `Generate a ${type} practice report based on the following data:

Summary Statistics:
${JSON.stringify(summary, null, 2)}

Recent Sessions:
${JSON.stringify(sessions.slice(0, 10), null, 2)}

Provide a comprehensive report in JSON format:
{
  "summary": "Overall summary of the period",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvements": ["string"],
  "recommendations": ["string"]
}`;

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content:
						'You are an expert music practice coach creating comprehensive practice reports. Provide insightful, encouraging, and actionable feedback. Always respond with valid JSON only.'
				},
				{ role: 'user', content: prompt }
			],
			temperature: 0.7,
			response_format: { type: 'json_object' }
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error('No response from OpenAI');
		}

		return JSON.parse(content);
	} catch (error) {
		console.error('AI report generation error:', error);
		throw error;
	}
}
