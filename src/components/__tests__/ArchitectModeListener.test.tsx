import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArchitectModeListener } from '../ArchitectModeListener';
import { useArchitectMode } from '@/hooks/useArchitectMode';

// Mock the hook
vi.mock('@/hooks/useArchitectMode');

describe('ArchitectModeListener', () => {
  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Keyboard Shortcut', () => {
    it('toggles architect mode on Shift+Tab', () => {
      vi.mocked(useArchitectMode).mockReturnValue({
        isActive: false,
        hasAccess: true,
        toggle: mockToggle,
        activate: vi.fn(),
        deactivate: vi.fn(),
      });

      render(<ArchitectModeListener />);

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(mockToggle).toHaveBeenCalledTimes(1);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('does not toggle on Tab without Shift', () => {
      vi.mocked(useArchitectMode).mockReturnValue({
        isActive: false,
        hasAccess: true,
        toggle: mockToggle,
        activate: vi.fn(),
        deactivate: vi.fn(),
      });

      render(<ArchitectModeListener />);

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: false,
        bubbles: true,
      });

      window.dispatchEvent(event);

      expect(mockToggle).not.toHaveBeenCalled();
    });

    it('does not toggle on Shift with other keys', () => {
      vi.mocked(useArchitectMode).mockReturnValue({
        isActive: false,
        hasAccess: true,
        toggle: mockToggle,
        activate: vi.fn(),
        deactivate: vi.fn(),
      });

      render(<ArchitectModeListener />);

      const event = new KeyboardEvent('keydown', {
        key: 'A',
        shiftKey: true,
        bubbles: true,
      });

      window.dispatchEvent(event);

      expect(mockToggle).not.toHaveBeenCalled();
    });
  });

  describe('Access Control', () => {
    it('does not attach listener when user has no access', () => {
      vi.mocked(useArchitectMode).mockReturnValue({
        isActive: false,
        hasAccess: false,
        toggle: mockToggle,
        activate: vi.fn(),
        deactivate: vi.fn(),
      });

      render(<ArchitectModeListener />);

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      });

      window.dispatchEvent(event);

      expect(mockToggle).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('removes event listener on unmount', () => {
      vi.mocked(useArchitectMode).mockReturnValue({
        isActive: false,
        hasAccess: true,
        toggle: mockToggle,
        activate: vi.fn(),
        deactivate: vi.fn(),
      });

      const { unmount } = render(<ArchitectModeListener />);

      unmount();

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      });

      window.dispatchEvent(event);

      expect(mockToggle).not.toHaveBeenCalled();
    });
  });

  describe('Rendering', () => {
    it('renders nothing (returns null)', () => {
      vi.mocked(useArchitectMode).mockReturnValue({
        isActive: false,
        hasAccess: true,
        toggle: mockToggle,
        activate: vi.fn(),
        deactivate: vi.fn(),
      });

      const { container } = render(<ArchitectModeListener />);

      expect(container.firstChild).toBeNull();
    });
  });
});
