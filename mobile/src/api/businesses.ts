import { authorizedRequest } from './client';
import {
  BusinessWithMembership,
  CreateBusinessData,
} from '../types/business';

export async function getBusinesses(): Promise<BusinessWithMembership[]> {
  return authorizedRequest<BusinessWithMembership[]>('/businesses', {
    method: 'GET',
  });
}

export async function createBusiness(
  data: CreateBusinessData,
): Promise<BusinessWithMembership> {
  return authorizedRequest<BusinessWithMembership>('/businesses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
