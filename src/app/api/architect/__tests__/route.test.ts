import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../route';
import { getUser } from '@/lib/auth';
import { isCreator } from '@/lib/creator';
import Anthropic from '@anthropic-ai/sdk';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/creator');
vi.mock('@anthropic-ai/sdk');

describe('/api/architect', () => {
  const mockRequest = (body: any) => ({
    json: async () => body,
  }) as any;

  const mockCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockClear();
    process.env.ANTHROPIC_API_KEY = 'test-api-key';

    // Mock Anthropic as a class that returns an object with messages.create
    (Anthropic as any).mockImplementation(function() {
      return {
        messages: { create: mockCreate },
      };
    });
  });

  describe('Authentication', () => {
    it('returns 403 when no user', async () => {
      vi.mocked(getUser).mockResolvedValue(null);

      const response = await POST(mockRequest({ message: 'test' }));
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Architect mode requires creator access');
    });

    it('returns 403 when user is not creator', async () => {
      vi.mocked(getUser).mockResolvedValue({
        id: '1',
        email: 'user@example.com',
      } as any);
      vi.mocked(isCreator).mockReturnValue(false);

      const response = await POST(mockRequest({ message: 'test' }));
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Architect mode requires creator access');
    });

    it('allows creator to proceed', async () => {
      vi.mocked(getUser).mockResolvedValue({
        id: '1',
        email: 'eddie@id8labs.com',
      } as any);
      vi.mocked(isCreator).mockReturnValue(true);

      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Response' }],
      });

      const response = await POST(mockRequest({ message: 'test query' }));

      expect(response.status).toBe(200);
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      vi.mocked(getUser).mockResolvedValue({
        id: '1',
        email: 'eddie@id8labs.com',
      } as any);
      vi.mocked(isCreator).mockReturnValue(true);
    });

    it('returns 400 when message is missing', async () => {
      const response = await POST(mockRequest({}));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Message required');
    });

    it('returns 400 when message is not a string', async () => {
      const response = await POST(mockRequest({ message: 123 }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Message required');
    });

    it('returns 500 when API key is missing', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const response = await POST(mockRequest({ message: 'test' }));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('API configuration missing');
    });
  });

  describe('Claude Integration', () => {
    beforeEach(() => {
      vi.mocked(getUser).mockResolvedValue({
        id: '1',
        email: 'eddie@id8labs.com',
      } as any);
      vi.mocked(isCreator).mockReturnValue(true);
    });

    it('calls Claude API with correct parameters', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Architect response' }],
      });

      await POST(mockRequest({ message: 'How does NVC analysis work?' }));

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-opus-4-20250514',
        max_tokens: 4096,
        system: expect.stringContaining('Architect Mode'),
        messages: [
          {
            role: 'user',
            content: 'How does NVC analysis work?',
          },
        ],
      });
    });

    it('includes system prompt for architect mode', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Response' }],
      });

      await POST(mockRequest({ message: 'test' }));

      const systemPrompt = mockCreate.mock.calls[0][0].system;

      expect(systemPrompt).toContain('Architect Mode');
      expect(systemPrompt).toContain('NVC Analysis Engine');
      expect(systemPrompt).toContain('Memory Layers');
      expect(systemPrompt).toContain('Intervention Logic');
    });

    it('appends context when provided', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Response' }],
      });

      const context = {
        session_id: 'abc123',
        temperature: 0.7,
      };

      await POST(mockRequest({ message: 'test', context }));

      const systemPrompt = mockCreate.mock.calls[0][0].system;

      expect(systemPrompt).toContain('Current Context');
      expect(systemPrompt).toContain('abc123');
      expect(systemPrompt).toContain('0.7');
    });

    it('returns formatted response', async () => {
      mockCreate.mockResolvedValue({
        content: [
          { type: 'text', text: 'First part' },
          { type: 'text', text: 'Second part' },
        ],
      });

      const response = await POST(mockRequest({ message: 'test' }));
      const data = await response.json();

      expect(data.message).toBe('First partSecond part');
      expect(data.timestamp).toBeDefined();
    });

    it('filters out non-text content blocks', async () => {
      mockCreate.mockResolvedValue({
        content: [
          { type: 'text', text: 'Text content' },
          { type: 'image', source: {} },
          { type: 'text', text: 'More text' },
        ],
      });

      const response = await POST(mockRequest({ message: 'test' }));
      const data = await response.json();

      expect(data.message).toBe('Text contentMore text');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getUser).mockResolvedValue({
        id: '1',
        email: 'eddie@id8labs.com',
      } as any);
      vi.mocked(isCreator).mockReturnValue(true);
    });

    it('returns 500 when Claude API fails', async () => {
      mockCreate.mockRejectedValue(new Error('API error'));

      const response = await POST(mockRequest({ message: 'test' }));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Architect mode unavailable');
    });

    it('logs errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockCreate.mockRejectedValue(new Error('Test error'));

      await POST(mockRequest({ message: 'test' }));

      expect(consoleSpy).toHaveBeenCalledWith(
        'Architect mode error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
