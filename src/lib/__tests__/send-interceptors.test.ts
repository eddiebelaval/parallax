import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handleArchitectMessage, handleProfileCommand } from '../send-interceptors';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('send-interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('handleArchitectMessage', () => {
    const mockSetFeedback = vi.fn();
    const mockSpeak = vi.fn();

    beforeEach(() => {
      mockSetFeedback.mockClear();
      mockSpeak?.mockClear();
    });

    it('sends message to /api/architect endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Architect response' }),
      });

      await handleArchitectMessage('test query', mockSetFeedback);

      expect(mockFetch).toHaveBeenCalledWith('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test query' }),
      });
    });

    it('shows consulting feedback immediately', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Response' }),
      });

      await handleArchitectMessage('query', mockSetFeedback);

      expect(mockSetFeedback).toHaveBeenNthCalledWith(1, 'Architect: Consulting architecture...');
    });

    it('shows response after API call completes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Detailed response' }),
      });

      await handleArchitectMessage('query', mockSetFeedback);

      expect(mockSetFeedback).toHaveBeenNthCalledWith(2, 'Architect: Detailed response');
    });

    it('clears feedback after 30 seconds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Response' }),
      });

      await handleArchitectMessage('query', mockSetFeedback);

      expect(mockSetFeedback).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(30000);

      expect(mockSetFeedback).toHaveBeenNthCalledWith(3, null);
    });

    it('calls speak function if provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Voice response' }),
      });

      await handleArchitectMessage('query', mockSetFeedback, mockSpeak);

      expect(mockSpeak).toHaveBeenCalledWith('Voice response');
    });

    it('does not call speak if not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Response' }),
      });

      await handleArchitectMessage('query', mockSetFeedback);

      expect(mockSpeak).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await handleArchitectMessage('query', mockSetFeedback);

      expect(mockSetFeedback).toHaveBeenCalledWith('Architect: Consulting architecture...');
      // Error handling depends on implementation - adjust as needed
    });

    it('handles non-OK responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await handleArchitectMessage('query', mockSetFeedback);

      expect(mockSetFeedback).toHaveBeenCalledWith('Architect: Consulting architecture...');
    });
  });

  describe('handleProfileCommand', () => {
    const mockSetFeedback = vi.fn();
    const mockSetModal = vi.fn();
    const mockSpeak = vi.fn();
    const mockConcierge = {
      isCommand: vi.fn(),
      processCommand: vi.fn(),
      confirm: vi.fn(),
      cancel: vi.fn(),
      updateSetting: vi.fn(),
    };

    beforeEach(() => {
      mockSetFeedback.mockClear();
      mockSetModal.mockClear();
      mockSpeak?.mockClear();
      mockConcierge.isCommand.mockClear();
      mockConcierge.processCommand.mockClear();
    });

    it('returns false if not a command', async () => {
      mockConcierge.isCommand.mockReturnValue(false);

      const result = await handleProfileCommand(
        'regular message',
        mockConcierge as any,
        mockSetFeedback,
        mockSetModal
      );

      expect(result).toBe(false);
      expect(mockConcierge.isCommand).toHaveBeenCalledWith('regular message');
      expect(mockConcierge.processCommand).not.toHaveBeenCalled();
    });

    it('returns true and processes command', async () => {
      mockConcierge.isCommand.mockReturnValue(true);
      mockConcierge.processCommand.mockResolvedValue({
        success: true,
        message: 'Setting updated',
        requires_confirmation: false,
      });

      const result = await handleProfileCommand(
        'change my name to Alex',
        mockConcierge as any,
        mockSetFeedback,
        mockSetModal
      );

      expect(result).toBe(true);
      expect(mockConcierge.processCommand).toHaveBeenCalledWith('change my name to Alex');
    });

    it('shows success feedback', async () => {
      mockConcierge.isCommand.mockReturnValue(true);
      mockConcierge.processCommand.mockResolvedValue({
        success: true,
        message: 'Name changed to Alex',
        requires_confirmation: false,
      });

      await handleProfileCommand(
        'change my name to Alex',
        mockConcierge as any,
        mockSetFeedback,
        mockSetModal
      );

      expect(mockSetFeedback).toHaveBeenCalledWith('Success: Name changed to Alex');
    });

    it('shows error feedback on failure', async () => {
      mockConcierge.isCommand.mockReturnValue(true);
      mockConcierge.processCommand.mockResolvedValue({
        success: false,
        message: 'Invalid value',
        requires_confirmation: false,
      });

      await handleProfileCommand(
        'invalid command',
        mockConcierge as any,
        mockSetFeedback,
        mockSetModal
      );

      expect(mockSetFeedback).toHaveBeenCalledWith('Error: Invalid value');
    });

    it('shows confirmation modal for dangerous actions', async () => {
      mockConcierge.isCommand.mockReturnValue(true);
      mockConcierge.processCommand.mockResolvedValue({
        success: false,
        message: 'Delete account',
        requires_confirmation: true,
        confirmation_prompt: 'Are you sure you want to delete your account?',
      });

      await handleProfileCommand(
        'delete my account',
        mockConcierge as any,
        mockSetFeedback,
        mockSetModal
      );

      expect(mockSetModal).toHaveBeenCalledWith({
        isOpen: true,
        title: 'Confirm Action',
        message: 'Are you sure you want to delete your account?',
        isDangerous: true,
        onConfirm: expect.any(Function),
      });
    });

    it('calls speak function with response if provided', async () => {
      mockConcierge.isCommand.mockReturnValue(true);
      mockConcierge.processCommand.mockResolvedValue({
        success: true,
        message: 'Email notifications enabled',
        requires_confirmation: false,
      });

      await handleProfileCommand(
        'turn on email',
        mockConcierge as any,
        mockSetFeedback,
        mockSetModal,
        mockSpeak
      );

      expect(mockSpeak).toHaveBeenCalledWith('Email notifications enabled');
    });

    it('handles errors gracefully', async () => {
      mockConcierge.isCommand.mockReturnValue(true);
      mockConcierge.processCommand.mockRejectedValue(new Error('API error'));

      const result = await handleProfileCommand(
        'command',
        mockConcierge as any,
        mockSetFeedback,
        mockSetModal,
        mockSpeak
      );

      expect(result).toBe(true);
      expect(mockSetFeedback).toHaveBeenCalledWith('Error: Failed to process profile command');
      expect(mockSpeak).toHaveBeenCalledWith('Error: Failed to process profile command');
    });

    it('executes confirmation callback when user confirms', async () => {
      mockConcierge.isCommand.mockReturnValue(true);
      mockConcierge.processCommand.mockResolvedValue({
        success: false,
        message: 'Delete account',
        requires_confirmation: true,
        confirmation_prompt: 'Confirm deletion?',
      });

      mockConcierge.confirm.mockResolvedValue({
        success: true,
        message: 'Account deleted',
      });

      await handleProfileCommand(
        'delete my account',
        mockConcierge as any,
        mockSetFeedback,
        mockSetModal
      );

      const confirmCallback = mockSetModal.mock.calls[0][0].onConfirm;

      await confirmCallback();

      expect(mockConcierge.confirm).toHaveBeenCalled();
      expect(mockSetFeedback).toHaveBeenCalledWith('Success: Account deleted');
      expect(mockSetModal).toHaveBeenCalledWith(null);
    });
  });
});
