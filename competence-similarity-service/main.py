from fastapi import FastAPI
from sentence_transformers import SentenceTransformer, util
from pydantic import BaseModel

app = FastAPI(title="Competence Similarity Service")

# Charger le modèle recommandé
model = SentenceTransformer('all-mpnet-base-v2')

class SimilarityRequest(BaseModel):
    competence1: str
    competence2: str

class SimilarityResponse(BaseModel):
    competence1: str
    competence2: str
    similarity: float

@app.post("/similarity", response_model=SimilarityResponse)
async def get_similarity(request: SimilarityRequest):
    # Normaliser les entrées
    competence1 = request.competence1.lower().strip()
    competence2 = request.competence2.lower().strip()
    # Ajouter un contexte
    context = "Programming skill: "
    embedding1 = model.encode(context + competence1, convert_to_tensor=True)
    embedding2 = model.encode(context + competence2, convert_to_tensor=True)
    similarity = util.cos_sim(embedding1, embedding2).item()
    return {
        "competence1": request.competence1,
        "competence2": request.competence2,
        "similarity": similarity
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}