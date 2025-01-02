import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import Groq from 'groq-sdk';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });

export async function POST(req: Request) {
    try {
      const { prompt, model } = await req.json();
      let result;
      
      const startTime = Date.now();
      
      if (model === 'gpt-4') {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
        });
        
        result = {
          modelName: 'gpt-4',
          response: response.choices[0].message.content,
          responseTime: (Date.now() - startTime) / 1000,
        };
      } 
      else if (model === 'llama-70b') {
        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
        });
        
        result = {
          modelName: 'llama-70b',
          response: response.choices[0]?.message?.content,
          responseTime: (Date.now() - startTime) / 1000,
        };
      }
      else if (model === 'mixtral') {
        const response = await groq.chat.completions.create({
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: prompt }],
        });
        
        result = {
          modelName: 'mixtral',
          response: response.choices[0]?.message?.content,
          responseTime: (Date.now() - startTime) / 1000,
        };
      }
  
      // Store in database
      await prisma.experiment.create({
        data: {
          prompt,
          results: {
            create: [result]
          }
        }
      });
  
      return NextResponse.json(result);
      
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}