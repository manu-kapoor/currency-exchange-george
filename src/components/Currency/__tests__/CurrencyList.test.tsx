import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

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
    await waitFor(() => {
        // and then hide it when SUCCESS/api failure
        expect(screen.queryByText('Loading Currencies...')).not.toBeInTheDocument();
    });
    return utils;
};
describe('<CurrencyList/>', () => {
    it('should load all the countries from API', async () => {
        await renderCurrencyList();
        expect(screen.getAllByRole('row')).toHaveLength(fxData.fx.length + 1); // plus one for the header
    });

    it('should load flags for all countries including placeholders for missing flags', async () => {
        await renderCurrencyList();

        // Assumption: no other images are rendered inside CurrencyList
        expect(screen.getAllByRole('img')).toHaveLength(fxData.fx.length);
    });
});
