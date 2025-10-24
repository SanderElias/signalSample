import { TestBed } from '@angular/core/testing';
import { SignalTable } from './signal-table.service';
import { SampleDataService } from '../sample-data.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

// Mock SampleDataService
class MockSampleDataService {
  totalCount = vi.fn(() => 3);
  getIdList = vi.fn((prop, order, filter) => vi.fn(() => ['1', '2', '3']));
}

describe('SignalTable', () => {
  let service: SignalTable;
  let data: MockSampleDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SignalTable,
        { provide: SampleDataService, useClass: MockSampleDataService },
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(SignalTable);
    data = TestBed.inject(SampleDataService) as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default pageSize', () => {
    expect(service.pageSize()).toBe(19);
  });

  it('should have the correct totalCount', () => {
    expect(service.totalCount()).toBe(3);
  });

  it('should call totalCount in list computed', () => {
    service.list();
    expect(data.totalCount).toHaveBeenCalled();
  });

  it('should get list of IDs from getIdList', () => {
    expect(service.list()).toEqual(['1', '2', '3']);
  });

  it('should compute page correctly', () => {
    service.pageSize.set(2);
    service.currentPage.set(0);
    expect(service.computedPage()).toEqual(['1', '2']);
    service.currentPage.set(1);
    expect(service.computedPage()).toEqual(['3', undefined]);
  });

  it('should update list when sortProp changes', () => {
    service.sortProp.set('firstName');
    service.list();
    expect(data.getIdList).toHaveBeenCalledWith('firstName', 1, '');
  });

  it('should update list when order changes', () => {
    service.order.set(-1);
    service.list();
    expect(data.getIdList).toHaveBeenCalledWith(undefined, -1, '');
  });

  it('should update list when filter changes', () => {
    service.filter.set('test');
    service.list();
    expect(data.getIdList).toHaveBeenCalledWith(undefined, 1, 'test');
  });

  it('should handle pagination out of bounds', () => {
    service.pageSize.set(2);
    service.currentPage.set(10); // out of bounds should end on last page
    expect(service.computedPage()).toEqual(["3", undefined]);
  });

  it('should return empty array if list is empty', () => {
    data.getIdList.mockImplementation(() => vi.fn(() => []));
    expect(service.list()).toEqual([]);
    expect(service.computedPage()).toEqual([undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
  });
});
