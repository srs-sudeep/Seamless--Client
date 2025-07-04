import { Card, CardContent, DynamicForm, HelmetWrapper, toast } from '@/components';
import { type FieldType } from '@/types';
import { CreateAdditionalInfoPayload } from '@/types';
import { useState } from 'react';
import { useCreateAdditionalInfo } from '@/hooks';
import { CheckCircle, Info } from 'lucide-react';

const InfoSchema: FieldType[] = [
  {
    name: 'title',
    label: 'Info Title',
    type: 'text',
    required: true,
    columns: 2,
    placeholder: 'Enter Title',
    section: 'Additional Information',
  },
  {
    name: 'description',
    label: 'Info Description',
    type: 'textarea',
    required: true,
    columns: 2,
    placeholder: 'Enter complete info ',
    section: 'Additional Information',
  },
];

const CreateAdditionalInfo = () => {
  const createMutation = useCreateAdditionalInfo();
  const [infoData, setInfoData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleSubmit = async (data: Record<string, any>) => {
    console.log(data.title);
    console.log(data.description);
    if (!data.title || !data.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all the required fields,',
        variant: 'destructive',
      });
      return;
    }
    try {
      await createMutation.mutateAsync(data as CreateAdditionalInfoPayload);
      toast({
        title: 'Sucess!',
        description: 'Inforamtion added successfully',
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setInfoData({});
        setIsSubmitted(false);
      }, 2000);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create Info. Please try again.',
        variant: 'destructive',
      });
    }
  };
  return (
    <HelmetWrapper
      title="Create Additional Info"
      heading="Create Additional Info"
      subHeading="Add new Information for the patients"
    >
      <div className="space-y-8">
        {/* Additional Information Form */}
        <Card className="border-2 border-border shadow-lg ">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Info className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Additional Details</h3>
                <p className="text-muted-foreground">
                  Enter the information to add it to the information list
                </p>
              </div>
            </div>

            {!isSubmitted ? (
              <DynamicForm
                schema={InfoSchema}
                onSubmit={handleSubmit}
                defaultValues={infoData}
                onChange={setInfoData}
                submitButtonText={
                  createMutation.isPending ? 'Creating Information...' : 'Create Information'
                }
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Information Successfully Added!
                </h3>
                <p className="text-muted-foreground mb-6">
                  {infoData.title} has been added to the Information list.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium">{infoData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description:</span>
                      <span className="font-medium text-right max-w-48">
                        {infoData.description}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HelmetWrapper>
  );
};

export default CreateAdditionalInfo;
