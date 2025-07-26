
import React from "react";
import { BodyHeatMap } from "./BodyHeatMap";

export default {
  title: "Analytics/BodyHeatMap",
  component: BodyHeatMap,
};

export const Default = () => <BodyHeatMap userId="test-athlete" />;

// Sample data for the MuscleHeatMap loaded story with load values (0-100)
const sampleLoadData = [
  { muscle: "pectoralis_major", load: 85 },
  { muscle: "anterior_deltoid", load: 72 },
  { muscle: "anterior_deltoid_right", load: 68 },
  { muscle: "biceps_brachii", load: 60 },
  { muscle: "biceps_brachii_right", load: 58 },
  { muscle: "rectus_abdominis", load: 90 },
  { muscle: "external_oblique", load: 75 },
  { muscle: "external_oblique_right", load: 73 },
  { muscle: "quadriceps_femoris", load: 95 },
  { muscle: "quadriceps_femoris_right", load: 92 },
  { muscle: "rectus_femoris", load: 88 },
  { muscle: "rectus_femoris_right", load: 85 },
  { muscle: "vastus_lateralis", load: 80 },
  { muscle: "vastus_lateralis_right", load: 82 },
  { muscle: "tibialis_anterior", load: 45 },
  { muscle: "tibialis_anterior_right", load: 43 },
  { muscle: "trapezius", load: 70 },
  { muscle: "latissimus_dorsi", load: 65 },
  { muscle: "latissimus_dorsi_right", load: 67 },
  { muscle: "posterior_deltoid", load: 55 },
  { muscle: "posterior_deltoid_right", load: 53 },
  { muscle: "triceps_brachii", load: 62 },
  { muscle: "triceps_brachii_right", load: 64 },
  { muscle: "gluteus_maximus", load: 78 },
  { muscle: "gluteus_maximus_right", load: 76 },
  { muscle: "biceps_femoris", load: 87 },
  { muscle: "biceps_femoris_right", load: 89 },
  { muscle: "gastrocnemius", load: 50 },
  { muscle: "gastrocnemius_right", load: 52 },
  { muscle: "erector_spinae", load: 40 },
  { muscle: "rhomboid_major", load: 35 },
  { muscle: "brachialis", load: 48 },
  { muscle: "brachialis_right", load: 46 },
];

export const MuscleHeatMapLoaded = () => (
  <BodyHeatMap 
    userId="test-athlete" 
    mockData={sampleLoadData}
  />
);

// Keep the title as specified in the task
MuscleHeatMapLoaded.storyName = "MuscleHeatMap • loaded";
