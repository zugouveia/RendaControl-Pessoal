FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

# Copia tudo da pasta atual (RendaControl) para dentro do container
COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "RendaControl.dll"]