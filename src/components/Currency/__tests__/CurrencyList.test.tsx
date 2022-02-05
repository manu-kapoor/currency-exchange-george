import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { rest } from 'msw';
import { server } from 'mocks/mockServer';
import fxData from 'mocks/data/fx.json';

import { store } from 'app/store';
import CurrencyList from 'components/Currency/CurrencyList';

const renderCurrencyList = async () => {
    const utils = render(
        <Provider store={store}>
            <CurrencyList />
        </Provider>
    );
    // Show loading currencies while fetching from API
    expect(await screen.findByText('Loading Currencies...')).toBeInTheDocument();
    await waitFor(() => {
        // and then hide it when loaded
        expect(screen.queryByText('Loading Currencies...')).not.toBeInTheDocument();
    });
    return utils;
};
describe('<CurrencyList/>', () => {
    it('should load all the countries from API', async () => {
        await renderCurrencyList();
        expect(screen.getAllByRole('row')).toHaveLength(fxData.fx.length);
    });

    it('should load flags for all countries including placeholders for missing flags', async () => {
        await renderCurrencyList();

        // Assumption: no other images are rendered inside CurrencyList
        expect(screen.getAllByRole('img')).toHaveLength(fxData.fx.length);
    });

    it('should show an error message if API call failed', async () => {
        server.resetHandlers(
            rest.get('https://run.mocky.io/v3/c88db14a-3128-4fbd-af74-1371c5bb0343', (req, resp, ctx) => {
                return resp(ctx.status(400, 'Server Error'));
            })
        );
        await renderCurrencyList();
        // TODO: Improve this test
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('Oops. There was an Error fetching currencies.');
    });

    it('should show an appropriate message if API returns 0 currencies', async () => {
        server.resetHandlers(
            rest.get('https://run.mocky.io/v3/c88db14a-3128-4fbd-af74-1371c5bb0343', (req, resp, ctx) => {
                return resp(ctx.json({ ...fxData, fx: [] }));
            })
        );
        await renderCurrencyList();
        // TODO: Improve this test
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('No currencies available.');
    });
});
