'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { apiEndPoint } from '@/app/helpers/apiEndPoint';
import { modHeaders } from '@/app/helpers/modHeaders';
import { show_error } from '@/app/helpers/show_error';
import { getAuthSessionData } from '@/app/controller/auth_controller';
import { isNull } from '@/app/helpers/isNull';

type RequestOptions = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  headersType?: 'mod' | 'basic' | 'apiKey';
  remark: string;
  iniOptions: any;
};

export async function clearCache(tag: string) {
  revalidateTag(tag);
}

export async function apiRequest({
  url,
  method = 'GET',
  data,
  headersType = 'mod',
  remark,
  iniOptions = {},
}: RequestOptions): Promise<any> {
  const auth = await getAuthSessionData();

  let finalUrl = url as any;

  try {
    finalUrl = new URL(url);
  } catch (error) {
    finalUrl = await apiEndPoint(url);
  }

  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${auth.accessToken}`,
  };

  switch (headersType) {
    case 'mod':
      headers = await modHeaders(method.toLowerCase() as any);
      break;
    case 'apiKey':
      headers = {
        ...headers,
        'x-api-key': auth.api_key ?? '',
        'x-api-secret': auth.api_secret ?? '',
      };
      break;
    case 'basic':
    default:
      headers = {
        ...headers,
        Authorization: `Bearer ${auth.accessToken}`,
      };
      break;
  }

  const options: RequestInit = {
    method,
    headers,
    ...iniOptions,
  };

  if (['POST', 'PATCH'].includes(method.toUpperCase()) && data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(finalUrl, options);

  if (!response.ok) {
    show_error(`request error on ${remark ?? 'no remark'}: ${response.statusText}`, '', false);
    return { response, result: {}, data: {} };
  }

  const result = await response.json();

  return {
    result,
    data: result?.data,
    responseStatus: response.ok,
    statusText: response.statusText,
  };
}

export async function setCookie(data: any, key: string, age = 3600, type = 'json') {
  try {
    const cookieStore = await cookies();
    cookieStore.set(key, type === 'json' ? JSON.stringify(data) : data, {
      maxAge: age,
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      // sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return true;
  } catch (error) {
    console.info(process.env.NODE_ENV === 'development' ? data : 'cookie data');
    console.error('Error during set cookie:', error);
    return null;
  }
}

export async function setPublicCookie({
  data,
  key,
  age = 3600,
  type = 'json',
}: {
  data: any;
  key: string;
  age?: number;
  type?: 'json' | 'string';
}) {
  try {
    const cookieStore = await cookies();

    cookieStore.set(key, type === 'json' ? JSON.stringify(data) : data, {
      maxAge: age, // in seconds
      httpOnly: false, // ✅ allow access in document.cookie
      secure: false, // ✅ allow over HTTP (dev environment)
      sameSite: 'lax', // ✅ good default for most use cases
      path: '/', // ✅ make cookie available site-wide
    });

    return true;
  } catch (error) {
    console.info(process.env.NODE_ENV === 'development' ? data : 'cookie data');
    console.error('Error during set cookie:', error);
    return null;
  }
}

export async function getCookie(key: string, type = 'json') {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(key)?.value;

    if (isNull(value)) return null;

    if (type === 'json' && value) {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }

    return value;
  } catch (error) {
    console.error('Error during get cookie:', error);
    return null;
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function getOpenAIResponse({
  model,
  prompt,
  temperature = 1,
  maxTokens = 4000,
  context,
  instruction = 'You are a skilled blog content writer who creates HTML SEO friendly',
  promptImage = [],
}: {
  model: AiModelType;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  context?: string;
  instruction?: string;
  promptImage?: Array<{ url: string }>; // assumes { url: string } format
}) {
  // Construct multimodal message content
  const messageContent: Array<any> = [];
  let result = '';

  try {
    if (prompt) {
      messageContent.push({ type: 'text', text: prompt });
    }

    if (promptImage && promptImage.length > 0) {
      for (const img of promptImage) {
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: img.url,
          },
        });
      }
    }

    const response = await openai.chat.completions.create({
      model: model?.partnerId ?? '',
      messages: [
        ...(context ? [{ role: 'assistant' as const, content: context }] : []),
        { role: 'system' as const, content: instruction ?? '' },
        { role: 'user' as const, content: messageContent },
      ],
      [model.maxTokenKey ?? 'max_tokens']: maxTokens,
      temperature,
      stream: true,
    });

    for await (const chunk of response) {
      const content = chunk?.choices?.[0]?.delta?.content;
      if (content) {
        result += content;
      }
    }
  } catch (error) {}
  return { data: result.trim() };
}
