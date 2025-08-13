import { renderHook, act } from '@testing-library/react';
import useDarkMode from '../useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  it('writes theme to localStorage and data attribute', () => {
    const { result } = renderHook(() => useDarkMode());
    act(() => result.current[1](true));
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    act(() => result.current[1](false));
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
