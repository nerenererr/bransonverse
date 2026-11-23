/*persona 1 */
import { jest } from '@jest/globals';

import {
    getBransonById,
    selectRandomBranson,
    checkClawSuccess,
    generateMachineBransons
} from '../src/js/random-selection.js';


describe('Pruebas de selección de Bransons', () => {

    test('El ID 2 debe corresponder a Brenda', () => {
        const branson = getBransonById(2);

        expect(branson.name).toBe('Brenda');
    });

    test('Un ID inexistente debe devolver undefined', () => {
    const branson = getBransonById(99);

    expect(branson).toBeUndefined();
    });

    test('La selección aleatoria debe devolver un Branson válido', () => {
    const branson = selectRandomBranson();

    expect(branson).toBeDefined();
    expect(branson.id).toBeGreaterThanOrEqual(1);
    expect(branson.id).toBeLessThanOrEqual(9);
    });

    test('La selección debe respetar los pesos de aparición', () => {
    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0);

        const branson = selectRandomBranson();

        expect(branson.name).toBe('Standard Branson');
    } finally {
        randomSpy.mockRestore();
    }
    });

    test('Los pesos deben seleccionar correctamente a Brenda y Nekobranson', () => {
    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0.20);
        expect(selectRandomBranson().name).toBe('Brenda');

        randomSpy.mockReturnValue(0.55);
        expect(selectRandomBranson().name).toBe('Nekobranson');

    } finally {
        randomSpy.mockRestore();
    }
    });

    test('La garra debe fallar cuando el número aleatorio es menor que la probabilidad de caída', () => {
    const randomSpy = jest.spyOn(Math, 'random');

    try {
        const branson = getBransonById(5); // Nekobranson: 55% de caída

        randomSpy.mockReturnValue(0.30);

        const success = checkClawSuccess(branson);

        expect(success).toBe(false);

    } finally {
        randomSpy.mockRestore();
    }
    });

    test('La garra debe conseguir al Branson cuando el número aleatorio supera su probabilidad de caída', () => {
    const randomSpy = jest.spyOn(Math, 'random');

    try {
        const branson = getBransonById(5); // Nekobranson: 55% de caída

        randomSpy.mockReturnValue(0.80);

        const success = checkClawSuccess(branson);

        expect(success).toBe(true);

    } finally {
        randomSpy.mockRestore();
    }
    });

    test('La máquina debe generar 15 Bransons', () => {
    const machineBransons = generateMachineBransons();

    expect(machineBransons).toHaveLength(15);
    });

    test('Todos los Bransons generados deben pertenecer a la colección', () => {
    const machineBransons = generateMachineBransons();

    machineBransons.forEach(branson => {
        const originalBranson = getBransonById(branson.id);

        expect(originalBranson).toBeDefined();
        expect(branson).toEqual(originalBranson);
    });
    });

    test('La máquina debe permitir Bransons repetidos', () => {
    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0);

        const machineBransons = generateMachineBransons();

        expect(machineBransons).toHaveLength(15);

        machineBransons.forEach(branson => {
            expect(branson.id).toBe(1);
            expect(branson.name).toBe('Standard Branson');
        });

    } finally {
        randomSpy.mockRestore();
    }
    });

});

