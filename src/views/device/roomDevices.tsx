import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { DynamicTable, HelmetWrapper } from '@/components';
import {
  useRoomDeviceMappings,
  useRooms,
  useCreateRoomDeviceMapping,
  useDeleteRoomDeviceMapping,
} from '@/hooks/bodhika/useRooms.hook';

const RoomDevicesManagement = () => {
  const { data: rooms = [], isLoading: isRoomsLoading } = useRooms();
  const { data: mappings = [], isLoading: isMappingsLoading } = useRoomDeviceMappings();
  const createMapping = useCreateRoomDeviceMapping();
  const deleteMapping = useDeleteRoomDeviceMapping();

  const deviceIds = useMemo(() => {
    const set = new Set<string>();
    mappings?.forEach((m: any) => set.add(m.device_id));
    return Array.from(set);
  }, [mappings]);

  const mappingLookup = useMemo(() => {
    const lookup: Record<string, Set<string>> = {};
    mappings?.forEach((m: any) => {
      if (!lookup[m.device_id]) lookup[m.device_id] = new Set();
      lookup[m.device_id].add(m.room_id);
    });
    return lookup;
  }, [mappings]);

  const getTableData = () =>
    deviceIds.map(device_id => {
      const row: Record<string, any> = {
        'Device ID': device_id,
        _row: { device_id },
      };
      rooms.forEach(room => {
        const assigned = mappingLookup[device_id]?.has(room.room_id) ?? false;
        const isLoading = createMapping.isPending || deleteMapping.isPending;

        row[room.room_id] = (
          <button
            type="button"
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              assigned ? 'bg-green-500' : 'bg-gray-300'
            }`}
            aria-pressed={assigned}
            tabIndex={0}
            disabled={isLoading}
            onClick={() => {
              if (assigned) {
                deleteMapping.mutate({ room_id: room.room_id, device_id });
              } else {
                createMapping.mutate({ room_id: room.room_id, device_id });
              }
            }}
          >
            <span
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                assigned ? 'translate-x-4' : ''
              }`}
            />
          </button>
        );
      });
      return row;
    });

  return (
    <HelmetWrapper
      title="Room Devices | Seamless"
      heading="Room Device Mapping"
      subHeading="Assign and manage devices for each room."
    >
      <div className="mx-auto p-6">
        {isRoomsLoading || isMappingsLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable tableHeading="Room Device Mappings" data={getTableData()} />
        )}
      </div>
    </HelmetWrapper>
  );
};

export default RoomDevicesManagement;
