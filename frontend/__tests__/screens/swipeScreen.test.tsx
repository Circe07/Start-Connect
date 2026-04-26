import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import SwipeScreen from '../../src/screens/discover/SwipeScreen';

const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
  useMutation: (...args: any[]) => mockUseMutation(...args),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

describe('SwipeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it('renders loading state', async () => {
    mockUseQuery.mockReturnValue({
      isLoading: true,
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<SwipeScreen />);
    });

    const textNodes = tree!.root.findAllByType(require('react-native').Text);
    expect(textNodes.map(node => node.props.children).join(' ')).toContain(
      'Cargando recomendaciones',
    );
  });

  it('renders error state from discover query', async () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: { success: false, error: 'Discover unavailable' },
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<SwipeScreen />);
    });

    const textNodes = tree!.root.findAllByType(require('react-native').Text);
    expect(textNodes.map(node => node.props.children).join(' ')).toContain(
      'Discover unavailable',
    );
  });

  it('renders empty state when no cards are available', async () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: { success: true, data: { items: [] } },
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<SwipeScreen />);
    });

    const textNodes = tree!.root.findAllByType(require('react-native').Text);
    expect(textNodes.map(node => node.props.children).join(' ')).toContain(
      'Ya no hay tarjetas por ahora',
    );
  });

  it('shows contextual CTA label for group cards', async () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      data: {
        success: true,
        data: {
          items: [{ id: 'group:g1', type: 'group', title: 'Runners', raw: { id: 'g1' } }],
        },
      },
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<SwipeScreen />);
    });

    const textNodes = tree!.root.findAllByType(require('react-native').Text);
    const allText = textNodes.map(node => node.props.children).join(' ');
    expect(allText).toContain('Me interesa');
    expect(allText).toContain('Ver grupo');
  });
});
