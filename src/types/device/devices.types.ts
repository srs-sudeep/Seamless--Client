export interface Device {
  device: {
    device_id: string;
    status: string;
    token: string;
    ip: string;
    created_at: string;
    updated_at: string;
  };
  service_ids: string[];
}
